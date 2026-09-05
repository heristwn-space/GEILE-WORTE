"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Toast from "./Toast";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function BedroomQuizScreen({
  session,
  onBackToMenu,
  isSoundOn,
  setIsSoundOn,
  musicVolume,
  setMusicVolume,
  sfxVolume,
  setSfxVolume
}) {
  const [loading, setLoading] = useState(true);
  const [roomObjects, setRoomObjects] = useState([]);
  const [solvedObjects, setSolvedObjects] = useState([]);
  const [activeObject, setActiveObject] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profile, setProfile] = useState({ username: "", email: "", gender: "" });

  const [helpData, setHelpData] = useState([]);
  const [helpQuestions, setHelpQuestions] = useState([]);
  const [helpStep, setHelpStep] = useState(0);
  const [helpInputValue, setHelpInputValue] = useState("");
  const [helpIsWrong, setHelpIsWrong] = useState(false);

  const sortedObjectIds = [
    'objek_dinding_kamar',
    'objek_karpet_kamar',
    'objek_kasur_kamar',
    'objek_lampur_tidur',
    'objek_meja_kamar',
    'objek_mading_kamar',
    'objek_laptop_kamar',
    'objek_lampu_belajar',
    'objek_kursi_belajar',
  ];
  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("room")
          .select("object_id, name_de")
          .eq("room_name", "kamar tidur");
        if (roomError) throw roomError;
        setRoomObjects(roomData || []);

        if (session?.user?.id) {
          // Filter progress hanya untuk object_id di room ini
          const roomObjectIds = (roomData || []).map(r => r.object_id);

          const { data: progressData, error: progressError } = await supabase
            .from("progres")
            .select("object_id, is_done")
            .eq("profile_id", session.user.id)
            .eq("is_done", true)
            .in("object_id", roomObjectIds.length > 0 ? roomObjectIds : ["__none__"]);
          if (progressError) throw progressError;
          setSolvedObjects(progressData ? progressData.map(p => p.object_id) : []);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username, gender")
            .eq("id", session.user.id)
            .single();
          if (!profileError && profileData) {
            setProfile({
              username: profileData.username || "Spieler",
              email: session.user.email || "",
              gender: profileData.gender || "Divers"
            });
          }
        }

        const { data: qData, error: qError } = await supabase
          .from("bantuan_kuis")
          .select("id, pertanyaan, jawaban_de");
        if (!qError && qData) setHelpData(qData);
      } catch (err) {
        console.error("Error fetching data:", err);
        showToast("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
  };

  const handleObjectClick = (objectId) => {
    if (solvedObjects.includes(objectId)) return;
    const obj = roomObjects.find(r => r.object_id === objectId);
    // Selalu buka modal — jika belum ada di DB, tampilkan dengan name_de kosong
    setActiveObject(obj || { object_id: objectId, name_de: "" });
    setInputValue("");
    setIsWrong(false);
    setHelpStep(0);
  };

  const handleCheckAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!activeObject) return;
    const answer = inputValue.trim().toLowerCase();
    const correctAnswer = activeObject.name_de.trim().toLowerCase();

    if (answer === correctAnswer) {
      try { const a = new Audio("/assets/sound/sound-benar.mp3"); a.volume = sfxVolume / 100; a.play().catch(() => {}); } catch {}
      const newSolved = [...solvedObjects, activeObject.object_id];
      setSolvedObjects(newSolved);
      setActiveObject(null);
      setHelpStep(0);
      try {
        await supabase.from("progres").upsert(
          { profile_id: session.user.id, object_id: activeObject.object_id, is_done: true },
          { onConflict: "profile_id,object_id" }
        );
      } catch (err) { console.error("Error saving progress:", err); }

      const totalToSolve = roomObjects.length > 0 ? roomObjects.length : 9;
      if (newSolved.length >= totalToSolve) {
        try {
          await supabase.from("profiles").update({ room_kamar: true }).eq("id", session.user.id);
          setShowFinishModal(true);
        } catch (err) { console.error("Error updating profile:", err); }
      } else {
        showToast("Richtig! Vokabel erfolgreich gefunden.", "success");
      }
    } else {
      try { const a = new Audio("/assets/sound/fail.mp3"); a.volume = sfxVolume / 100; a.play().catch(() => {}); } catch {}
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
      showToast("Falsch! Versuchen Sie es noch einmal.", "error");
    }
  };

  const handleStartHelp = () => {
    if (helpData.length < 2) { showToast("Nicht genügend Hilfedaten vorhanden.", "error"); return; }
    const shuffled = [...helpData].sort(() => 0.5 - Math.random());
    setHelpQuestions(shuffled.slice(0, 2));
    setHelpStep(1);
    setHelpInputValue("");
    setHelpIsWrong(false);
  };

  const handleCheckHelpAnswer = (e) => {
    if (e) e.preventDefault();
    if (helpStep < 1 || helpStep > 2) return;
    const answer = helpInputValue.trim().toLowerCase();
    const correctAnswer = helpQuestions[helpStep - 1].jawaban_de.trim().toLowerCase();
    if (answer === correctAnswer) {
      try { const a = new Audio("/assets/sound/sound-benar.mp3"); a.volume = sfxVolume / 100; a.play().catch(() => {}); } catch {}
      if (helpStep === 1) {
        setHelpStep(2); setHelpInputValue(""); setHelpIsWrong(false);
        showToast("Richtig! Nächste Frage.", "success");
      } else {
        setHelpStep(0); setHelpInputValue("");
        setInputValue(activeObject.name_de);
        showToast("Erfolgreich! Die Antwort wurde eingetragen.", "success");
      }
    } else {
      try { const a = new Audio("/assets/sound/fail.mp3"); a.volume = sfxVolume / 100; a.play().catch(() => {}); } catch {}
      setHelpIsWrong(true);
      setTimeout(() => setHelpIsWrong(false), 500);
      showToast("Falsch! Versuchen Sie es noch einmal.", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper — paths extracted directly from kamar-tidur.svg
  const getObjectGeometry = (objectId, fill, stroke, strokeWidth, className, onClick) => {
    switch (objectId) {
      case "objek_dinding_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M978.5 395.632L978.147 395.522L957.147 389.022L957.012 388.98L956.875 389.016L431.875 525.016L431.5 525.113V664.781L382.174 646.531L382.026 646.477L381.875 646.516L355.045 653.471L344.207 648.545L344.093 648.493L343.967 648.501L329.379 649.473L305.483 557.874L305.446 557.731L305.338 557.632L293.338 546.632L293.177 546.483L292.958 546.502L269.599 548.448L271.493 537.082L271.539 536.81L271.332 536.626L262.332 528.626L262.229 528.534L262.094 528.509L241.094 524.509L240.938 524.479L240.793 524.545L229.793 529.545L229.562 529.649L229.511 529.897L219.46 577.639L219.62 577.825L228.62 588.325L228.724 588.446L228.879 588.485L240.879 591.485L240.938 591.5H256.24L256.391 591.312L262.391 583.812L262.472 583.711L262.493 583.584L266.931 557.449L276.562 556.246L276.573 556.245L276.585 556.242L289.353 554.032L296.085 559.803L300.525 570.163L321.388 650.631L311.389 653.012L298.902 655.51L298.849 655.521L298.799 655.542L286.299 661.042L286.272 661.054L286.248 661.068L274.248 668.068L274.168 668.115L274.109 668.188L268.216 675.553L220.017 686.981L214 685.131V596.391L213.402 596.51L79.9023 623.01L79.5 623.09V722.114L0.5 742.852V1H1919.5V1010.29L1815.5 973.146L1813.5 499.96L1856.04 496.498L1856.05 496.497L1856.07 496.495L1881.57 492.995L1881.64 492.985L1881.71 492.952L1890.21 488.952L1890.61 488.764L1890.47 488.343L1852.47 373.843L1852.44 373.73L1849.3 370.596L1849.24 370.562L1843.74 367.562L1843.67 367.521L1843.58 367.507L1828.58 365.007L1828.55 365.001L1828.51 365L1809.51 364.5H1809.49L1789.49 365H1789.47L1789.46 365.002L1776.46 366.002L1776.38 366.008L1776.3 366.041L1764.8 371.041L1764.64 371.11L1761.56 376.761L1761.54 376.797L1761.53 376.836L1723.53 486.336L1723.41 486.675L1723.69 486.895L1732.69 493.895L1732.81 493.982L1732.95 493.997L1766.95 497.497V497.498L1766.96 497.499L1800 499.964V968.278L1594.1 891.376L1645.7 857.463L1692.62 845.484L1692.9 845.415L1692.98 845.147L1694.98 838.647L1695.03 838.487L1694.97 838.331L1683.47 806.331L1683.46 806.302L1683.45 806.273L1649.45 739.273L1649.43 739.236L1649.4 739.203L1625.4 706.703L1625.31 706.58L1625.17 706.529L1569.17 686.529L1569.14 686.52L1569.12 686.514L1222.23 604.541L1206.83 591.123L1206.79 591.091L1206.75 591.065L1199.75 587.065L1199.68 587.028L1199.61 587.012L1116.11 568.512L1116.05 568.5H1102.41L1102.32 568.533L1081.46 576.479L1000.85 559.064L978.5 510.391V395.632Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M328.024 864.828L322.117 875.657L311.746 883.065L298.831 889.026L283.375 893.016L265.929 897.003L252.463 898.001L233.973 899.001L233.962 899.002L214.517 900.497L176.091 895.507L161.617 892.014L161 891.865V919.354L161.335 919.472L200.011 933.008L0.5 1005.29V882.388L155.624 842.483L341.358 796.673L328.024 864.828Z" />
          </>
        );
      case "objek_karpet_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M245.538 1020.81L245.464 1020.99L245.529 1021.17L248.029 1028.17L248.067 1028.27L253.227 1033.43L253.334 1033.47L261.834 1036.47L261.883 1036.49L261.934 1036.5L269.434 1037.5L269.586 1037.52L269.724 1037.45L275.897 1034.36L275.967 1034.18L280.695 1021.88L293.571 1034.28L296.5 1042.09V1047.68L283.859 1053.51L190.936 1065.5L190.653 1065.54L190.54 1065.8L187.54 1072.8L187.5 1072.9V1079.5H56.7725L239.174 1011.47L251.112 1007.34L245.538 1020.81ZM428 1032.39L425.957 1027.8L425.919 1027.71L416.938 1018.73L414.975 1012.84L414.913 1012.66L414.745 1012.56L406.745 1008.06L406.568 1007.96L406.373 1008.02L396.873 1010.52L396.829 1010.53L396.789 1010.55L339.5 1037.22V978.318L354.013 971.545L370.572 978.364L372.514 986.614L372.565 986.836L372.766 986.941L382.766 992.241L382.9 992.312L383.052 992.296L395.552 990.997L395.712 990.98L395.832 990.874L400.332 986.874L400.518 986.709L400.498 986.462L399.998 979.962L399.986 979.804L399.886 979.683L392.886 971.183L392.792 971.067L392.65 971.023L383.15 968.023L383.044 967.989L382.933 968.005L372.12 969.479L367.137 966.157L383.154 960.976L383.163 960.973L383.171 960.97L467.638 930.164L471.013 945.11L471.064 945.341L471.276 945.447L478.276 948.947L478.438 949.027L478.612 948.987L485.112 947.487L485.312 947.441L485.422 947.269L488.922 941.769L489.012 941.627L488.998 941.461L487.528 922.849L540.659 904.974L540.667 904.972L540.675 904.969L591.494 886.035L620.918 897.805L617.513 912.89L617.5 912.944V923.062L617.515 923.121L619.515 931.121L619.535 931.201L619.579 931.271L624.079 938.271L624.104 938.309L624.135 938.342L631.635 946.342L631.672 946.382L631.717 946.412L639.717 951.912L639.727 951.919L639.737 951.926L656.737 962.426L656.755 962.436L672.755 971.436L672.776 971.447L689.776 979.947L689.818 979.969L689.864 979.981L709.364 985.481L709.431 985.5H726.382L829.276 1036.95L829.293 1036.96L829.31 1036.96L932.477 1079.5H394.123L375.244 1069.56L363.927 1062.67L362.033 1056.05L364.892 1050.33L393.5 1029.97V1041.18L397.609 1046.31L397.645 1046.36L397.688 1046.39L402.688 1050.39L402.745 1050.44L402.814 1050.46L407.956 1052.52L408.104 1052.49L415.104 1050.99L415.176 1050.97L415.239 1050.94L420.739 1047.94L420.843 1047.88L420.909 1047.79L424.416 1042.78L424.422 1042.77L427.922 1037.27L428 1037.15V1032.39Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M297.412 1073L302.585 1074.88L303.846 1079.5H228.124L290.523 1073H297.412Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M347.257 1079.5H335.001L338.648 1077.98L340.972 1077.51L347.257 1079.5Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M1716.7 991.93L1725 1003.16V1015.32L1721.16 1020.12L1629.35 1080H1279.83L1525.57 934.541L1716.7 991.93Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M314.512 1028.37L281.427 997.678L314.991 984.731L314.512 1028.37Z" />
          </>
        );
      case "objek_kasur_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M978 395.873V510.618L990.043 534.704L1000.54 559.197L1000.64 559.436L1000.9 559.489L1081.4 576.489L1081.54 576.52L1081.68 576.468L1104.07 568.006L1116.92 568.994L1199.82 587.473L1205.21 590.409L1222.17 605.375L1222.26 605.458L1222.38 605.486L1565.86 686.48L1624.2 706.923L1647.58 736.775L1670.05 778.72L1685.04 811.69L1694.98 839.026L1694.03 842.808L1692.68 845.066L1646.38 857.016L1646.3 857.036L1646.23 857.079L1552.73 917.079L1459.75 974.567L1278.87 1079.5H936.595L824.207 1035.04L726.226 985.554L726.119 985.5H707.089L677.22 974.548L627.358 943.135L618 928.851V913.059L621.487 898.113L621.584 897.696L621.188 897.536L592.688 886.036L592.685 886.035L492.114 846.205L540.478 690.148L540.595 689.77L540.253 689.568L517.253 676.068L517.06 675.955L516.847 676.024L486.014 685.97L433 665.656V523.888L956.49 389.519L978 395.873Z" />
          </>
        );
      case "objek_lampur_tidur":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M1800.5 499.543L1800.04 499.502L1733.19 493.515L1724.09 486.328L1763.41 373.348L1776.14 366.49L1803.02 364.5H1828.45L1844.78 367.964L1852.07 373.798L1890.38 488.239L1880.37 493.01L1813.95 499.502L1813.5 499.547V997.455L1813.95 997.498L1834.94 999.496L1862.8 1004.47L1873.5 1012.25V1030.28L1867.24 1036.06L1853.89 1040.51L1811.99 1045L1774.07 1042.5L1753.68 1038.03L1741.5 1031.21V1015.05L1742.45 1010.3L1751.2 1004.47L1765.58 1001.49L1781.56 999.496L1800.05 997.497L1800.5 997.449V499.543Z" />
          </>
        );
      case "objek_meja_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M356 653.878V667.265L355.781 667.413L344.781 674.913L344.734 674.945L344.681 674.966L329.181 680.966L329.152 680.978L329.123 680.984L303.623 687.484L303.578 687.496L295.531 687.999H295.523L285.023 688.499L284.989 688.501L284.955 688.498L279.455 687.998L279.405 687.993L279.357 687.979L274.297 686.479L274.149 686.436L274.052 686.315L271.612 683.315L271.548 683.236L271.52 683.138L270.52 679.638L270.514 679.618L270.51 679.598L269.613 675.11L221.42 687.04L308.641 712.521L309 712.625V715.856L308.663 715.973L169.663 763.973L169.498 764.029L169.333 763.972L80.333 732.472L80 732.354V722.643L0.5 742.888V881.359L342.068 796.092L354.781 727.908L354.836 727.615L355.12 727.524L484.498 685.957L381.977 646.526L356 653.878Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M488.98 941.863L485.167 947.106L482.356 948.513L478.091 948.986L474.224 947.053L470.451 945.166L467.994 930.428L466.514 915.62L471.424 907.765L471.441 907.735L475.441 900.235L475.452 900.215L475.461 900.194L479.461 890.694L479.469 890.677L479.475 890.658L482.257 882.31L488.98 941.863Z" />
          </>
        );
      case "objek_mading_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M60.0039 335.561L60.0508 335.947L60.4375 335.996L72.4688 337.5H82.0117L84.4873 440H59.4834L29.9766 440.983L25.5186 340.916L45.0859 337.492L45.5312 337.415L45.499 336.964L44.0342 316.946L57.5625 315.547L60.0039 335.561Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M164.5 372.011L164.011 372L97.0166 370.511L100.483 267H145V245.45L158.5 244.054V265.531L159.03 265.499L199.5 263.031V332.491L199.991 332.5L253.991 333.5L254.032 333.501L254.073 333.494L267.573 331.494L267.99 331.433L268 331.011L268.489 308.5H283V328.537L283.535 328.499L311 326.537V477.519L220.98 481L220.5 481.019V535H206.559L206.504 535.438L206.011 539.381L204.556 543.26L200.686 548.581L193.944 550.988L186.202 550.021L181.414 546.19L179.5 541.404V533.517L179.017 533.5L148.517 532.5H148.493L148.471 532.501L72.4873 536.97L70.5107 453.977L103.522 452.499L104 452.479V441.46L164.041 436.498L164.5 436.46V372.011Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M384 258V282H399V363.5H345V282H369.5V258H384Z" />
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M456.002 333.042L456.041 333.5H476.5V416.5H429V490.5H374V407.5H393V387.5H407V407.5H423V333.5H442.062L441.997 332.942L439.551 311.904L447.059 310.497L454.043 310.031L456.002 333.042Z" />
          </>
        );
      case "objek_laptop_kamar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M213.5 684.874L213.859 684.979L309 712.874V715.644L170.001 763.97L80 732.146V622.91L213.5 596.607V684.874Z" />
          </>
        );
      case "objek_lampu_belajar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M251.909 525.993L262.245 528.946L270.474 536.691L269.004 548.94L268.926 549.591L269.573 549.494L283.062 547.495L283.062 547.496L290.922 546.514L296.21 548.917L301.62 554.327L304.573 558.265L308.527 566.174L329.015 649.12L329.108 649.5H344.442L350.816 650.971L355.037 653.315L356 660.537V666.741L344.265 675.053L329.332 680.528L319.376 683.515L303.432 687.003L286.01 687.998L275.225 687.018L271.462 683.255L270.012 675.521L271.437 670.299L280.749 663.438L296.163 656.973L308.622 653.484L320.602 650.989L321.11 650.884L320.985 650.38L305.485 587.88L305.478 587.853L296.978 560.353L296.941 560.234L291.726 555.019L291.545 555.002L286.045 554.502L285.982 554.496L285.92 554.507L267.42 557.507L267.062 557.564L267.006 557.923L263.025 583.295L259.655 587.628L255.349 590.5H239.076L229.732 587.549L223.868 583.15L220.031 577.396L229.938 529.844L240.093 525.009L251.909 525.993Z" />
          </>
        );
      case "objek_kursi_belajar":
        return (
          <>
            <path fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} onClick={onClick} d="M315.5 959.061L315.064 959.004L303.564 957.504L303.482 957.493L303.402 957.51L295.951 959H282.064L266.625 955.016L251.149 951.021L161.5 918.648V892.618L181.896 896.989L181.921 896.994L181.947 896.997L214.947 900.497L214.99 900.502L215.034 900.499L266.034 896.999L266.076 896.996L266.118 896.986L299.118 888.986L299.165 888.975L299.208 888.954L311.208 883.454L311.244 883.438L311.277 883.416L321.777 876.416L321.884 876.345L321.943 876.231L327.943 864.731L327.976 864.669L327.99 864.601L355.932 728.386L516.951 676.54L540.899 689.247L475.043 901.282L461.151 922.12L450.374 928H441.815L441.676 928.119L428.233 939.569L410.804 947.039L392.355 954.02L369.423 959.005L354.434 961.004L352.646 961.243L354.302 961.959L372.802 969.959L372.931 970.015L373.07 969.995L383.463 968.51L393.2 971.432L399.5 979.669V986.328L396.218 990.548L389.479 991.992L378.686 990.521L372.422 986.184L370.975 981.842L369.98 978.362L369.919 978.145L369.714 978.048L341.214 964.548L340.511 964.215L340.5 964.993L339.5 1036.99L339.489 1037.78L340.207 1037.46L351.207 1032.46L351.215 1032.45L351.224 1032.45L372.228 1021.95L393.681 1010.97L404.98 1008.02L409.279 1009.45L415.086 1013.32L417.03 1018.67L417.064 1018.76L417.132 1018.84L422.628 1024.83V1024.83L427.023 1029.72L427.98 1036.9L424.587 1042.71L420.168 1048.12L415.319 1051.03L407.566 1052.48L400.322 1049.1L393.99 1040.82L393.499 1031.47L393.451 1030.56L392.707 1031.09L378.208 1041.59L365.708 1050.59L365.646 1050.64L365.6 1050.7L362.6 1054.7L362.457 1054.89L364.515 1063.12L364.567 1063.33L364.757 1063.44L393.576 1079.5H351.053L339.606 1077.01L339.444 1076.98L339.293 1077.04L333.892 1079.5H304.36L302.975 1075.34L302.913 1075.16L302.743 1075.06L298.243 1072.56L298.13 1072.5H290.977L290.953 1072.5L216.974 1079.5H187.5V1074.1L190.855 1065.95L206.071 1063.49L206.072 1063.5L247.065 1057.5L281.543 1054.5L281.61 1054.49L281.673 1054.47L291.173 1050.97L291.229 1050.95L291.277 1050.92L295.977 1047.78L295.998 1047.54L296.498 1042.04L296.511 1041.9L293.447 1035.78L293.422 1035.73L293.387 1035.68L281.887 1021.68L281.383 1021.07L281.047 1021.79L277.556 1029.27L274.641 1034.13L270.369 1036.5H261.086L254.264 1034.06L247.926 1028.21L246.5 1024.41V1020.59L251.399 1007.85L258.735 1003.94L258.899 1003.85L258.967 1003.68L261.419 997.302L266.678 993H273.366L276.726 994.919L280.684 997.888L314.663 1028.87L315.5 1029.63V959.061Z" />
          </>
        );
      default:
        return null;
    }
  };


  const renderObject = (objId) => {
    const isSolved = solvedObjects.includes(objId);
    return (
      <g key={"group-" + objId}>
        {getObjectGeometry(
          objId,
          isSolved ? "url(#bedroom-colored-pattern)" : "url(#bedroom-grayscale-pattern)",
          "none",
          undefined,
          "transition-all duration-300",
          undefined
        )}
        {!isSolved &&
          getObjectGeometry(
            objId,
            "transparent",
            "rgba(0,0,0,0.2)",
            2,
            "hover:fill-white/20 transition-all cursor-pointer duration-300",
            () => handleObjectClick(objId)
          )
        }
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
        <svg className="animate-spin h-10 w-10 text-[#ff6f61] mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-extrabold text-sm">Schlafzimmer-Quiz wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-zinc-950 p-4 overflow-hidden select-none">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Portrait warning */}
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-br from-[#ffd8a8] to-[#ff922b] text-zinc-950 text-center p-6 portrait:flex landscape:hidden">
        <div className="mb-6 border-4 border-zinc-950 p-4 rounded-2xl bg-white shadow-[6px_6px_0px_0px_#18181b] animate-bounce">
          <svg className="w-16 h-16 text-[#ff6f61] animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Bitte drehen Sie Ihr Handy!</h2>
        <p className="text-zinc-800 font-bold max-w-sm">Please rotate your phone to landscape mode to play the game properly.</p>
      </div>

      {/* Main game container */}
      <div className="relative w-[min(100%,calc(90vh*16/9))] max-w-[1000px] aspect-video bg-zinc-900 border-4 border-zinc-900 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] overflow-hidden">

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-35 flex justify-between items-center pointer-events-none">
          <button
            onClick={onBackToMenu}
            className="pointer-events-auto flex items-center justify-center gap-1.5 bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full px-4 py-2 text-xs font-extrabold text-zinc-950 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Menü
          </button>

          <div className="bg-[#ffd8a8] border-2 border-zinc-900 rounded-full px-5 py-2 text-xs md:text-sm font-black text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]">
            {solvedObjects.length} / {sortedObjectIds.length}
          </div>

          <div className="flex gap-2 pointer-events-auto">
            {activeObject && helpStep === 0 && (
              <button onClick={handleStartHelp} className="flex items-center justify-center bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full w-9 h-9 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer" aria-label="Hilfe">
                <svg className="w-4 h-4 text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            )}
            <button onClick={() => setIsSoundOn(!isSoundOn)} className="flex items-center justify-center bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full w-9 h-9 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer" aria-label="Sound toggeln">
              {isSoundOn ? (
                <svg className="w-4 h-4 text-[#ff6f61]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5A1.5 1.5 0 003 10.5v3A1.5 1.5 0 004.5 15h3.25L12 18.75z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H3v6h1.5l3.75 3.25V5.25z" /></svg>
              )}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full w-9 h-9 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer" aria-label="Einstellungen">
              <svg className="w-4 h-4 text-[#ff6f61] animate-[spin_10s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* SVG Interactive Area */}
        <svg viewBox="0 0 1920 1080" className="absolute inset-0 w-full h-full select-none pointer-events-auto">
          <defs>
            <filter id="grayscale-effect-bedroom">
              <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
            </filter>
            <pattern id="bedroom-grayscale-pattern" patternUnits="userSpaceOnUse" width="1920" height="1080">
              <image href="/assets/image-fix/kamar-tidur.jpg" x="0" y="0" width="1920" height="1080" filter="url(#grayscale-effect-bedroom)" />
            </pattern>
            <pattern id="bedroom-colored-pattern" patternUnits="userSpaceOnUse" width="1920" height="1080">
              <image href="/assets/image-fix/kamar-tidur.jpg" x="0" y="0" width="1920" height="1080" />
            </pattern>
          </defs>

          {/* Background: full grayscale room */}
          <image href="/assets/image-fix/kamar-tidur.jpg" x="0" y="0" width="1920" height="1080" filter="url(#grayscale-effect-bedroom)" />

          {/* Object layers */}
          <g id="kamar_tidur">
            {sortedObjectIds.map(objId => renderObject(objId))}
          </g>
        </svg>

        {/* Guessing Modal */}
        {activeObject && (
          <div className="absolute inset-0 z-30 bg-zinc-950/70 flex items-center justify-center p-2 md:p-4">
            <div className={`relative w-[90%] max-w-[360px] md:max-w-[420px] bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] px-6 py-6 md:px-8 md:py-8 text-center select-none animate-playful-bounce ${isWrong ? "animate-shake" : ""}`}>
              <button onClick={() => { setActiveObject(null); setHelpStep(0); }} className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-full w-6 h-6 md:w-8 md:h-8 font-extrabold shadow-[1.5px_1.5px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 text-[10px] md:text-xs" aria-label="Schließen">✕</button>
              <h3 className="font-adigiana text-base sm:text-lg md:text-xl lg:text-2xl font-black text-zinc-900 mb-4 pt-2 px-6">Errate das deutsche Wort!</h3>
              <form onSubmit={handleCheckAnswer} className="flex flex-col gap-4">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Deutsches Wort eingeben (mit der/die/das)..." className="w-full px-3 py-2 md:px-4 md:py-3 bg-zinc-50 border-2 md:border-3 border-zinc-900 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-extrabold text-center text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm md:text-base" autoFocus />
                <button type="submit" className="w-full bg-[#ff6f61] border-2 md:border-3 border-zinc-900 rounded-full py-2 px-4 md:py-3 md:px-6 text-white font-extrabold hover:scale-[1.03] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#18181b] cursor-pointer text-xs sm:text-sm md:text-base">Prüfen</button>
              </form>
            </div>
          </div>
        )}

        {/* Help Challenge Modal */}
        {helpStep > 0 && helpStep <= 2 && (
          <div className="absolute inset-0 z-40 bg-zinc-950/80 flex items-center justify-center p-2 md:p-4">
            <div className={`relative w-[90%] max-w-[380px] md:max-w-[440px] bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] px-6 py-6 md:px-8 md:py-8 text-center select-none animate-playful-bounce ${helpIsWrong ? "animate-shake" : ""}`}>
              <button onClick={() => setHelpStep(0)} className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-full w-6 h-6 md:w-8 md:h-8 font-extrabold shadow-[1.5px_1.5px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 text-[10px] md:text-xs" aria-label="Schließen">✕</button>
              <h3 className="font-adigiana text-base sm:text-lg md:text-xl lg:text-2xl font-black text-zinc-900 mb-2 pt-2 px-6">Hilfe-Herausforderung</h3>
              <p className="text-zinc-500 font-bold text-[10px] sm:text-xs mb-3">Frage {helpStep} von 2</p>
              <div className="bg-[#fffde7] border-2 md:border-3 border-zinc-900 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 shadow-[2px_2px_0px_0px_#18181b] min-h-[60px] md:min-h-[80px] flex items-center justify-center font-extrabold text-zinc-900 text-xs sm:text-sm md:text-base text-left">
                {helpQuestions[helpStep - 1]?.pertanyaan}
              </div>
              <form onSubmit={handleCheckHelpAnswer} className="flex flex-col gap-4">
                <input type="text" value={helpInputValue} onChange={(e) => setHelpInputValue(e.target.value)} placeholder="Antwort eingeben..." className="w-full px-3 py-2 md:px-4 md:py-3 bg-zinc-50 border-2 md:border-3 border-zinc-900 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-extrabold text-center text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm md:text-base" autoFocus />
                <button type="submit" className="w-full bg-[#ff6f61] border-2 md:border-3 border-zinc-900 rounded-full py-2 px-4 md:py-3 md:px-6 text-white font-extrabold hover:scale-[1.03] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#18181b] cursor-pointer text-xs sm:text-sm md:text-base">Prüfen</button>
              </form>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="absolute inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-[90%] max-w-[340px] md:max-w-[380px] bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] p-4 md:p-6 max-h-[95%] flex flex-col overflow-y-auto pointer-events-auto select-none">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-full w-6 h-6 md:w-8 md:h-8 font-extrabold shadow-[1.5px_1.5px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 text-[10px] md:text-xs" aria-label="Schließen">✕</button>
              <h3 className="font-adigiana text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 text-center mb-3 md:mb-4 pb-1.5 md:pb-2 border-b-3 border-zinc-100 pt-2">Einstellungen</h3>
              <div className="flex items-center gap-3 bg-[#fffde7] border-2 md:border-3 border-zinc-900 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-[2px_2px_0px_0px_#18181b] mb-3 md:mb-5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-[#ff6f61] border-2 md:border-3 border-zinc-900 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-xl font-extrabold shadow-[1.5px_1.5px_0px_0px_#18181b] flex-shrink-0">
                  {getInitials(profile.username)}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <h4 className="text-zinc-900 font-extrabold text-xs sm:text-sm md:text-base truncate">{profile.username}</h4>
                  <p className="text-zinc-500 font-bold text-[9px] sm:text-[10px] md:text-xs truncate">{profile.email}</p>
                  <span className="inline-block mt-0.5 bg-[#e8fbf3] text-[#2e7d32] border border-zinc-900 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-extrabold self-start shadow-[1px_1px_0px_0px_#18181b]">{profile.gender}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:gap-4 text-left">
                <div className="flex flex-col gap-0.5">
                  <label className="text-zinc-700 font-extrabold text-[10px] sm:text-xs md:text-sm flex justify-between"><span>Musik-Lautstärke</span><span className="text-zinc-500">{musicVolume}%</span></label>
                  <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} className="w-full h-1 md:h-2 bg-zinc-200 border border-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#ff6f61]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-zinc-700 font-extrabold text-[10px] sm:text-xs md:text-sm flex justify-between"><span>Effekt-Lautstärke (SFX)</span><span className="text-zinc-500">{sfxVolume}%</span></label>
                  <input type="range" min="0" max="100" value={sfxVolume} onChange={(e) => setSfxVolume(Number(e.target.value))} className="w-full h-1 md:h-2 bg-zinc-200 border border-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#ff6f61]" />
                </div>
              </div>
              <button onClick={() => setShowLogoutModal(true)} className="font-adigiana mt-4 w-full bg-zinc-100 hover:bg-zinc-200 border-2 md:border-3 border-zinc-900 rounded-full py-1.5 px-3 md:py-2 md:px-4 text-zinc-950 font-extrabold text-xs sm:text-sm md:text-base shadow-[2px_2px_0px_0px_#18181b] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Abmelden
              </button>
              <button onClick={() => setIsSettingsOpen(false)} className="font-adigiana mt-2 w-full bg-[#ff6f61] border-2 md:border-3 border-zinc-900 rounded-full py-1.5 px-3 md:py-2 md:px-4 text-white font-extrabold text-xs sm:text-sm md:text-base shadow-[2px_2px_0px_0px_#18181b] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer">Schließen</button>
            </div>
          </div>
        )}

        {/* Finish Modal */}
        {showFinishModal && (
          <div className="absolute inset-0 z-40 bg-zinc-950/80 flex items-center justify-center p-4">
            <div className="w-[90%] max-w-[360px] md:max-w-[400px] bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] p-6 md:p-8 text-center animate-playful-bounce">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-green-100 border-3 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-6 h-6 md:w-10 md:h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-adigiana text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 mb-2">Glückwunsch!</h3>
              <p className="text-zinc-700 font-extrabold text-xs sm:text-sm md:text-base mb-6">
                Schlafzimmer abgeschlossen! Du hast alle {sortedObjectIds.length} deutschen Vokabeln für das Schlafzimmer gefunden! 🎉
              </p>
              <button onClick={onBackToMenu} className="w-full bg-[#ff6f61] border-3 border-zinc-900 rounded-full py-2.5 px-6 md:py-3.5 md:px-8 text-white font-extrabold hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_0px_#18181b] cursor-pointer text-sm sm:text-base md:text-lg">
                Zurük zum Menü
              </button>
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRM MODAL */}
        {showLogoutModal && (
          <LogoutConfirmModal
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}

      </div>
    </div>
  );
}
